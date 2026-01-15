import { h } from "vue";
import SvgIcon from "@/components/Global/SvgIcon.vue";

type AnyObject = { [key: string]: any };

/**
 * 渲染图标
 * @param iconName 图标名称
 * @param option 图标选项（大小和样式）
 * @returns 图标组件
 */
export const renderIcon = (
  iconName: string,
  option: {
    size?: number;
    style?: AnyObject;
  } = {},
) => {
  const { size, style } = option;
  return () => {
    return h(SvgIcon, { name: iconName, size, style });
  };
};
