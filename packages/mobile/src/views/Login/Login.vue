<template>
  <div class="login-page">
    <van-nav-bar
      title="登录"
      left-arrow
      @click-left="onBack"
    />
    
    <div class="login-container">
      <div class="logo">
        <img src="/icons/favicon.png" alt="logo" />
        <h2>ToneSolo</h2>
      </div>

      <van-tabs v-model:active="activeTab" animated>
        <!-- 扫码登录 -->
        <van-tab title="扫码登录" name="qr">
          <div class="qr-login">
            <div class="qr-code-wrapper">
              <van-image
                v-if="qrImg"
                :src="qrImg"
                width="200"
                height="200"
                class="qr-image"
                :class="{ 'qr-expired': qrStatus === 800 }"
              />
              <div v-else class="qr-placeholder">
                <van-loading type="spinner" />
              </div>
              
              <div v-if="qrStatus === 800" class="qr-overlay" @click="getQrData">
                <van-icon name="replay" size="40" />
                <span>二维码已过期，点击刷新</span>
              </div>
              
              <div v-if="qrStatus === 802" class="qr-overlay success">
                <van-icon name="passed" size="40" />
                <span>扫描成功，请在手机上确认</span>
              </div>
            </div>
            <p class="qr-tip">{{ qrTip }}</p>
          </div>
        </van-tab>

        <!-- 手机号登录 -->
        <van-tab title="验证码登录" name="phone">
          <div class="phone-login">
            <van-form @submit="onPhoneLogin">
              <van-cell-group inset>
                <van-field
                  v-model="phone"
                  name="phone"
                  label="手机号"
                  placeholder="请输入手机号"
                  type="tel"
                  :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]"
                >
                  <template #button>
                    <van-button 
                      size="small" 
                      type="primary" 
                      :disabled="captchaCountdown > 0" 
                      @click="sendCaptcha"
                    >
                      {{ captchaCountdown > 0 ? `${captchaCountdown}s` : '发送验证码' }}
                    </van-button>
                  </template>
                </van-field>
                <van-field
                  v-model="captcha"
                  name="captcha"
                  label="验证码"
                  placeholder="请输入验证码"
                  type="digit"
                  :rules="[{ required: true, message: '请输入验证码' }]"
                />
              </van-cell-group>
              <div style="margin: 32px 16px;">
                <van-button round block type="primary" native-type="submit" :loading="loginLoading">
                  登录
                </van-button>
              </div>
            </van-form>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showSuccessToast, showFailToast } from 'vant';
import { qrKey, qrCreate, checkQr, loginPhone, sentCaptcha, verifyCaptcha } from '@core/api/login';
import { useDataStore } from '@core/stores';
import { updateUserData } from '@core/utils/auth';
import { setCookies } from '@core/utils/cookie';
import { useIntervalFn } from '@vueuse/core';

/**
 * 登录页面组件
 * 包含二维码登录和手机号验证码登录功能
 */

const router = useRouter();
const dataStore = useDataStore();

const activeTab = ref('qr');
const loginLoading = ref(false);

// 二维码登录相关
const qrImg = ref('');
const qrStatus = ref(0); // 0: 等待扫码, 800: 过期, 801: 等待确认, 802: 扫描成功, 803: 登录成功
const qrTip = ref('使用网易云音乐 APP 扫码登录');
let qrKeyStr = '';

// 手机号登录相关
const phone = ref('');
const captcha = ref('');
const captchaCountdown = ref(0);
let timer: any = null;

// 返回上一页
const onBack = () => {
  router.back();
};

// 获取二维码数据
const getQrData = async () => {
  try {
    qrStatus.value = 0;
    qrTip.value = '使用网易云音乐 APP 扫码登录';
    const keyRes = await qrKey();
    if (keyRes.code === 200) {
      qrKeyStr = keyRes.data.unikey;
      const qrRes = await qrCreate(qrKeyStr);
      if (qrRes.code === 200) {
        qrImg.value = qrRes.data.qrimg;
        resumeCheck();
      }
    }
  } catch (error) {
    showFailToast('获取二维码失败');
  }
};

// 检查二维码状态
const checkQrStatus = async () => {
  if (!qrKeyStr) return;
  try {
    const res = await checkQr(qrKeyStr);
    qrStatus.value = res.code;
    
    if (res.code === 800) {
      qrTip.value = '二维码已过期';
      pauseCheck();
    } else if (res.code === 801) {
      qrTip.value = '等待扫码...';
    } else if (res.code === 802) {
      qrTip.value = '扫描成功，请在手机上确认';
    } else if (res.code === 803) {
      pauseCheck();
      handleLoginSuccess(res.cookie, 'qr');
    }
  } catch (error) {
    console.error('检查二维码状态失败', error);
  }
};

const { pause: pauseCheck, resume: resumeCheck } = useIntervalFn(checkQrStatus, 2000, {
  immediate: false,
});

// 发送验证码
const sendCaptcha = async () => {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号');
    return;
  }
  try {
    const res = await sentCaptcha(Number(phone.value));
    if (res.code === 200) {
      showSuccessToast('验证码已发送');
      startCountdown();
    } else {
      showFailToast(res.message || '发送失败');
    }
  } catch (error) {
    showFailToast('发送验证码出错');
  }
};

// 倒计时
const startCountdown = () => {
  captchaCountdown.value = 60;
  timer = setInterval(() => {
    captchaCountdown.value--;
    if (captchaCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// 手机号登录提交
const onPhoneLogin = async () => {
  loginLoading.value = true;
  try {
    // 验证验证码
    const verifyRes = await verifyCaptcha(Number(phone.value), Number(captcha.value));
    if (verifyRes.code !== 200) {
      showFailToast('验证码错误');
      loginLoading.value = false;
      return;
    }
    
    // 登录
    const loginRes = await loginPhone(Number(phone.value), Number(captcha.value));
    if (loginRes.code === 200) {
      handleLoginSuccess(loginRes.cookie, 'phone');
    } else {
      showFailToast(loginRes.message || '登录失败');
    }
  } catch (error) {
    showFailToast('登录出错');
  } finally {
    loginLoading.value = false;
  }
};

// 处理登录成功
const handleLoginSuccess = async (cookie: string, type: 'qr' | 'phone') => {
  if (cookie && cookie.includes('MUSIC_U')) {
    // 保存 cookie
    setCookies(cookie.replaceAll(' HTTPOnly', ''));
    // 更新 store 状态
    dataStore.userLoginStatus = true;
    dataStore.loginType = type;
    localStorage.setItem('lastLoginTime', Date.now().toString());
    
    showSuccessToast('登录成功');
    
    // 获取用户信息
    await updateUserData();
    
    // 返回上一页
    router.replace('/library');
  } else {
    showFailToast('登录失败，未获取到有效凭证');
  }
};

onMounted(() => {
  getQrData();
});

onBeforeUnmount(() => {
  pauseCheck();
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: var(--van-background-2);
  
  .login-container {
    padding-top: 40px;
    
    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40px;
      
      img {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      h2 {
        margin-top: 16px;
        font-size: 24px;
        font-weight: 600;
        color: var(--van-text-color);
      }
    }
  }
  
  .qr-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 0;
    
    .qr-code-wrapper {
      position: relative;
      width: 200px;
      height: 200px;
      background: #fff;
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      
      .qr-image {
        &.qr-expired {
          filter: blur(4px);
          opacity: 0.5;
        }
      }
      
      .qr-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      
      .qr-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 12px;
        cursor: pointer;
        
        span {
          margin-top: 10px;
          font-size: 14px;
          color: var(--van-text-color);
          text-align: center;
          padding: 0 20px;
        }
        
        &.success {
          background: rgba(255, 255, 255, 0.9);
          span {
            color: var(--van-success-color);
          }
        }
      }
    }
    
    .qr-tip {
      margin-top: 20px;
      font-size: 14px;
      color: var(--van-text-color-2);
    }
  }
  
  .phone-login {
    padding-top: 20px;
  }
}
</style>
