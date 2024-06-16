import type { RouteRecordRaw } from 'vue-router';
import type { App } from 'vue';

import { createRouter, createWebHashHistory } from 'vue-router';
import { basicRoutes } from './routes';

// 白名单应该包含基本静态路由
const WHITE_NAME_LIST: string[] = [];
const getRouteNames = (array: any[]) =>
  array.forEach((item) => {
    WHITE_NAME_LIST.push(item.name);
    getRouteNames(item.children || []);
  });

getRouteNames(basicRoutes);

// 创建 Router
export const router = createRouter({
  // hash 路由
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
  // 应该添加到路由的初始路由列表
  routes: basicRoutes as unknown as RouteRecordRaw[],
  // 禁止尾部斜杠
  strict: true,
  // 路由切换后回到页面顶部
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 配置路由
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export function resetRouter() {
  router.getRoutes().forEach((route) => {
    const { name } = route;
    if (name && !WHITE_NAME_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name);
    }
  });
}
