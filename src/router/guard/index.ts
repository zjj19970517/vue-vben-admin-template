import { unref } from 'vue';
import type { Router, RouteLocationNormalized } from 'vue-router';
import { useAppStoreWithOut } from '/@/store/modules/app';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { useTransitionSetting } from '/@/hooks/setting/useTransitionSetting';
import { AxiosCanceler } from '/@/utils/http/axios/axiosCancel';
import { Modal, notification } from 'ant-design-vue';
import { warn } from '/@/utils/log';
import { setRouteChange } from '/@/logics/mitt/routeChange';
import { createPermissionGuard } from './permissionGuard';
import { createStateGuard } from './stateGuard';
import nProgress from 'nprogress';
import projectSetting from '/@/settings/projectSetting';
import { createParamMenuGuard } from './paramMenuGuard';

/**
 * 配置路由守卫
 * @param router 
 */
export function setupRouterGuard(router: Router) {
  // 用于处理页面加载状态（loaded）的全局守卫
  createPageGuard(router);

  // 用于处理页面加载状态（loading）的全局守卫
  createPageLoadingGuard(router);

  // 用于在路由切换时关闭当前页面未完成的接口请求
  createHttpGuard(router);

  // 切换路由的时候页面回到正上方
  createScrollGuard(router);

  // 用于在路由切换时关闭消息实例
  createMessageGuard(router);

  // 用于页面加载进度条
  createProgressGuard(router);

  // 创建权限守卫
  createPermissionGuard(router);

  // 创建参数菜单守卫
  createParamMenuGuard(router); // must after createPermissionGuard (menu has been built.)

  // 退出登录，回到登录页后，重置所有状态
  createStateGuard(router);
}

/**
 * 用于处理页面加载状态（loaded）的全局守卫
 * @param {Router} router
 */
function createPageGuard(router: Router) {
  const loadedPageMap = new Map<string, boolean>();
  router.beforeEach(async (to) => {
    // 页面已经加载，再次打开会更快，不需要进行加载和其他处理
    to.meta.loaded = !!loadedPageMap.get(to.path);
    // 发送全局事件通知路由发生变化
    setRouteChange(to);
    return true;
  });

  router.afterEach((to) => {
    // 后置钩子中更新路由的加载状态为 true
    loadedPageMap.set(to.path, true);
  });
}

/**
 * 用于处理页面加载状态（loading）的全局守卫
 * @param {Router} router
 */
function createPageLoadingGuard(router: Router) {
  // 用户信息相关的 Store 数据
  const userStore = useUserStoreWithOut();
  // 应用相关的 Store 数据
  const appStore = useAppStoreWithOut();
  const { getOpenPageLoading } = useTransitionSetting();

  router.beforeEach(async (to) => {
    // 用户未登录，直接跳过后面的处理
    if (!userStore.getToken) {
      return true;
    }
    // 页面已经加载过了，直接跳过后面的处理
    if (to.meta.loaded) {
      return true;
    }
    // 设置页面加载状态为 true
    if (unref(getOpenPageLoading)) {
      appStore.setPageLoadingAction(true);
      return true;
    }
    return true;
  });

  router.afterEach(async () => {
    if (unref(getOpenPageLoading)) {
      // 设置页面加载状态为 false
      setTimeout(() => {
        appStore.setPageLoading(false);
      }, 220);
    }
    return true;
  });
}

/**
 * 用于在路由切换时关闭当前页面未完成的接口请求
 * @param router
 */
function createHttpGuard(router: Router) {
  // 从项目设置中获取 removeAllHttpPending
  // 是否需要移除所有未完成的请求
  // 默认情况下，当路由切换时，不会移除所有未完成的请求，可以手动更改 ProjectConfig 的配置
  const { removeAllHttpPending } = projectSetting;
  let axiosCanceler: Nullable<AxiosCanceler>;
  if (removeAllHttpPending) {
    axiosCanceler = new AxiosCanceler();
  }
  router.beforeEach(async () => {
    // 切换路由将删除以前的请求
    axiosCanceler?.removeAllPending();
    return true;
  });
}

/**
 * 切换路由的时候页面回到正上方
 * @param {Router} router
 */
function createScrollGuard(router: Router) {
  const isHash = (href: string) => {
    return /^#/.test(href);
  };

  const body = document.body;

  router.afterEach(async (to) => {
    // 判断是否为 hash 路由
    // 如果时候 hash 路由，页面回到正上方
    isHash((to as RouteLocationNormalized & { href: string })?.href) && body.scrollTo(0, 0);
    return true;
  });
}

/**
 * 用于在路由切换时关闭消息实例
 * @param router
 */
export function createMessageGuard(router: Router) {
  const { closeMessageOnSwitch } = projectSetting;

  router.beforeEach(async () => {
    try {
      if (closeMessageOnSwitch) {
        Modal.destroyAll();
        notification.destroy();
      }
    } catch (error) {
      warn('message guard error:' + error);
    }
    return true;
  });
}

/**
 * 用于页面加载进度条
 * @export
 * @param {Router} router
 */
export function createProgressGuard(router: Router) {
  const { getOpenNProgress } = useTransitionSetting();
  router.beforeEach(async (to) => {
    if (to.meta.loaded) {
      return true;
    }
    unref(getOpenNProgress) && nProgress.start();
    return true;
  });

  router.afterEach(async () => {
    unref(getOpenNProgress) && nProgress.done();
    return true;
  });
}
