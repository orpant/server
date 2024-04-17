var express = require('express');
var router = express.Router();
const {v4:uuidv4} = require('uuid')
const { query } = require('../database/db')
const { verifyToken , generateToken } = require('../jwt/jwt')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/register',async(req,res)=>{
  //验证账户密码是否为空
  if(!req.body.username||!req.body.password){
    res.send({
      code:400,
      message:'用户名或密码不能为空'
    })
    return
  }
  // 验证账户密码的规则，账号是3-5位字符，密码是3-8位字符
  if(!req.body.username.match(/^[\u4E00-\u9FA5A-Za-z0-9]{3,5}$/
)||!req.body.password.match(/^[\u4E00-\u9FA5A-Za-z0-9]{3,5}$/
)){
    res.send({
      code:401,
      message:'用户名或密码格式不正确'
    })
    return
  }
  // 验证账户是否已存在
  const result = await query('SELECT * FROM user WHERE username=?',[req.body.username])
  if(result.length>0){
    res.send({
      code:402,
      message:'用户名已存在'
    })
    return
  }
  // 生成uuid作为用户id
  const userId = uuidv4()
  try{
    const result = query('INSERT INTO user (UUID,username,password) VALUES (?,?,?)',[userId,req.body.username,req.body.password])
    const token = generateToken({ UUID: userId })
    res.send({
      code:200,
      message:"注册成功",
      token
    })
  }catch (err){
    res.send({
      code:500,
      message:"注册失败"
    })
  }
})
// 登录接口
router.post('/login',async(req,res)=>{
  // 验证用户名密码是否为空
  if(!req.body.username||!req.body.password){
    res.send({
      code:400,
      message:'用户名或密码不能为空'
    })
    return
  }
  // 验证用户名密码的规则，账号是3-5位字符，密码是3-8位字符
  if(!req.body.username.match(/^[\u4E00-\u9FA5A-Za-z0-9]{3,5}$/
)||!req.body.password.match(/^[\u4E00-\u9FA5A-Za-z0-9]{3,5}$/
)){
    res.send({
      code:401,
      message:'用户名或密码格式不正确'
    })
    return
  }
  // 查询用户是否存在
  const result =await query('SELECT * FROM user WHERE username=?',[req.body.username])
  if(result.length===0){
    res.send({
      code:402,
      message:'用户名不存在'
    })
    return
  }
  // 验证密码是否正确
  if(result[0].password!==req.body.password){
    res.send({
      code:403,
      message:'密码错误'
    })
    return
  }
  // 生成token
  const token = generateToken({
    userId:result[0].UUID,
    username:result[0].username
  })
  res.send({
    code:200,
    message:'登录成功',
    token:token
  })
})

//获取用户信息
router.get('/info',async (req,res) => {
  //从header中获取token,并去除bearer
  const token = req.headers.authorization.split(' ')[1]
 //将token解析出成UUID
  const info = verifyToken(token)
  //通过UUID查询用户信息
  const result = await query('SELECT * FROM user WHERE UUID = ?',[info.UUID])
  res.send({
    code: 200,
    message: '获取成功',
    data: result[0]
  })
})
module.exports = router;
