/**
 * The routing of this file will not show the layout. It is an independent new page. the contents of the file still need to log in to access
 * 位于主框架之外的页面
 */
import type { AppRouteModule } from '/@/router/types';

// 测试: http://localhost:5173/main-out
export const mainOutRoutes: AppRouteModule[] = [
  {
    path: '/main-out',
    name: 'MainOut',
    component: () => import('/@/views/demo/main-out/index.vue'),
    meta: {
      title: 'MainOut',
      ignoreAuth: true,
    },
  },
];

export const mainOutRouteNames = mainOutRoutes.map((item) => item.name);
