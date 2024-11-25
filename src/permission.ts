import settings from './settings'
import router, {asyncRoutes} from '@/router'
import { progressClose, progressStart } from '@/hooks/use-permission'
import { useBasicStore } from '@/store/basic'
import { userInfoReq } from '@/api/user'
import { langTitle } from '@/hooks/use-common'

//路由进入前拦截
//to:将要进入的页面 vue-router4.0 不推荐使用next()
const whiteList = ['/login', '/register', '/404', '/401'] // no redirect whitelist
router.beforeEach(async (to) => {
  progressStart()
  document.title = langTitle(to.meta?.title) // i18 page title
  const basicStore = useBasicStore()

  //not login
  if (!settings.isNeedLogin) {
    basicStore.setFilterAsyncRoutes([])
    return true
  }
  //1.判断token
  if (basicStore.token) {
    if (to.path === '/login') {
      return '/'
    } else {
      //2.判断是否获取用户信息
      if (!basicStore.getUserInfo) {
        try {
          //3.用户信息
          const userInfo = await userInfoReq()
          //4.保存用户信息到store
          // @ts-ignore
          basicStore.setUserInfo(userInfo)
          //4.路由设置
          // 修改：不请求后端路由
          // const routeInfo = await getRouterReq()
          // filterAsyncRouter(routeInfo)

          // 修改：由后端权限决定路由
          const authMap: Map<string, boolean> = new Map<string, boolean>();
          // 模拟权限1
          authMap['1'] = true;
          // 请求后端修改authMap
          const okRoute = generateRoutes(asyncRoutes, authMap);
          // 添加过滤后的路由
          okRoute.forEach((route) => {
            router.addRoute(route)
          })
          basicStore.setFilterAsyncRoutes(okRoute)

          //5.再次执行路由跳转
          return { ...to, replace: true }
        } catch (e) {
          console.error(`route permission error${e}`)
          basicStore.resetState()
          progressClose()
          return `/login?redirect=${to.path}`
        }
      } else {
        return true
      }
    }
  } else {
    if (!whiteList.includes(to.path)) {
      return `/login?redirect=${to.path}`
    } else {
      return true
    }
  }
})
//路由进入后拦截
router.afterEach(() => {
  progressClose()
})
