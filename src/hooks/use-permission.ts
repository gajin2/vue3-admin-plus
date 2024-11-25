import NProgress from 'nprogress'
/**
 * 根据请求，过滤异步路由
 * @param:menuList 异步路由数组
 * return 过滤后的异步路由
 */

/*
 * 路由操作
 * */
import router, { constantRoutes, noMathPage } from '@/router'
//进度条
import 'nprogress/nprogress.css'
import { useBasicStore } from '@/store/basic'

//过滤异步路由
export function filterAsyncRouter(data) {
  const basicStore = useBasicStore()
  const fileAfterRouter = generatorRouter(data, 'menuId');



  //const fileAfterRouter = filterAsyncRouterByReq(data)
  //add 404-page router
  fileAfterRouter.push(noMathPage)

  fileAfterRouter.forEach((route) => router.addRoute(route))
  basicStore.setFilterAsyncRoutes(fileAfterRouter)
}

// 自定义权限路由
export function generateRoutes(routes: Array<any>, authMap: Map<string, boolean>) {
  const okRoute: any[] = [];
  routes.forEach(route => {

    // console.log(route);

    const tmp = { ...route };

    if (tmp.meta?.roles) { // 需要判断权限
      for (const it of tmp.meta?.roles) {
        if (authMap[it]) { // 有权限?
          okRoute.push(tmp);

          if (tmp.children) {
            tmp.children = generateRoutes(tmp.children, authMap);
          }
        }
      }
    } else {
      okRoute.push(tmp);
    }
  });

  return okRoute;
}

//重置路由
export function resetRouter() {
  //移除之前存在的路由
  const routeNameSet = new Set()
  router.getRoutes().forEach((fItem) => {
    if (fItem.name) routeNameSet.add(fItem.name)
  })
  // @ts-ignore
  routeNameSet.forEach((setItem) => router.removeRoute(setItem))
  //新增constantRoutes
  constantRoutes.forEach((feItem) => router.addRoute(feItem))
}

//重置登录状态
export function resetState() {
  resetRouter()
  useBasicStore().resetState()
}

//刷新路由
export function freshRouter(data) {
  resetRouter()
  filterAsyncRouter(data)
  // location.reload()
}

NProgress.configure({ showSpinner: false })
//开始进度条
export const progressStart = () => {
  NProgress.start()
}
//关闭进度条
export const progressClose = () => {
  NProgress.done()
}
