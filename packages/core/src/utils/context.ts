export interface RouterLike {
  push: (to: any) => Promise<any> | void | any;
  [key: string]: any;
}

export interface PackageInfo {
  version: string;
  productName?: string;
  author?: string;
  github?: string;
  [key: string]: any;
}

interface AppContext {
  router?: RouterLike;
  packageInfo?: PackageInfo;
}

const context: AppContext = {};

export const setAppContext = (ctx: AppContext) => {
  Object.assign(context, ctx);
};

export const getAppContext = () => context;
