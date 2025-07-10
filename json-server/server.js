const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.delete('/tasks/clearTasks', (req, res) => {
  const db = router.db;
  db.set('tasks', []).write();
  
  res.status(200).json({ 
    success: true,
  });
});

server.use(router);
server.listen(3000, function () {
  console.log('JSON Server is running')
})