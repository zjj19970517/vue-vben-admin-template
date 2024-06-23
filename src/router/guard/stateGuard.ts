import type { Router } from 'vue-router';
import { useAppStore } from '/@/store/modules/app';
import { useMultipleTabStore } from '/@/store/modules/multipleTab';
import { useUserStore } from '/@/store/modules/user';
import { usePermissionStore } from '/@/store/modules/permission';
import { PageEnum } from '/@/enums/pageEnum';
import { removeTabChangeListener } from '/@/logics/mitt/routeChange';

/**
 * 退出登录，回到登录页后，重置所有状态
 * @export
 * @param {Router} router
 */
export function createStateGuard(router: Router) {
  router.afterEach((to) => {
    // Just enter the login page and clear the authentication information
    if (to.path === PageEnum.BASE_LOGIN) {
      const tabStore = useMultipleTabStore();
      const userStore = useUserStore();
      const appStore = useAppStore();
      const permissionStore = usePermissionStore();
      // 重置应用状态
      appStore.resetAllState();
      // 重置权限状态
      permissionStore.resetState();
      // 重置多标签状态
      tabStore.resetState();
      // 重置用户状态
      userStore.resetState();
      // 移除路由变化监听
      removeTabChangeListener();
    }
  });
}
