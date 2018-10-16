module.exports = app => {
  const { router, controller } = app

  router.get('/', controller.home.index)
  router.get('/material.html', controller.material.index)
  router.get('/good.html', controller.good.index)
  router.get('/daily.html', controller.daily.index)
  router.get('/order.html', controller.order.index)
  router.get('/api/material/list', controller.material.list)
  router.get('/api/material/leadIn', controller.material.leadIn)
  router.get('/api/material/leadInRecipe', controller.material.leadInRecipe)
  router.get('/api/inventory/putInByBatch', controller.inventory.putInByBatch)
  router.get('/api/good/leadIn', controller.good.leadIn)
  router.get('/api/good/list', controller.good.list)
  router.get('/api/daily', controller.daily.index)
  router.get('/api/order/list', controller.order.list)
  router.get('/api/order/leadIn', controller.order.leadIn)
  router.get('/api/daily/list', controller.daily.list)
}
