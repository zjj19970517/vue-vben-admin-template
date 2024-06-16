import type { AppRouteRecordRaw, AppRouteModule } from '/@/router/types';

import { mainOutRoutes } from './mainOut';
import { PageEnum } from '/@/enums/pageEnum';
import { t } from '/@/hooks/web/useI18n';
import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '/@/router/routes/basic';

// import.meta.globEager() 直接引入所有的模块 Vite 独有的功能
const modules = import.meta.globEager('./modules/**/*.ts') as Record<string, any>;
// 记录全部的模块路由
const routeModuleList: AppRouteModule[] = [];

// 加入到路由集合中
Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

// 动态异步路由
export const asyncRoutes = [
  // 404
  PAGE_NOT_FOUND_ROUTE, 
  // 按模块划分的路由
  ...routeModuleList
];

// 根路由
export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME, // 重定向到 dashboard 仪表盘
  meta: {
    title: 'Root',
  },
};

// 登录页面
export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('/@/views/sys/login/Login.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
};

// 初始路由表
export const basicRoutes = [
  // 根路由
  RootRoute,
  // 登录页面
  LoginRoute,
  // 位于主框架之外的页面
  ...mainOutRoutes,
  // 负责重定向的特殊路由
  REDIRECT_ROUTE,
  // 错误日志记录
  PAGE_NOT_FOUND_ROUTE,
];
