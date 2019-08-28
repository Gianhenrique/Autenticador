const express = require ('express');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const crypto = require ('crypto');
const mailer = require ('../../modules/mailer')

const authConfig = require ('../../config/auth')

const User = require ('../models/user')

const router = express.Router();

//função para criar token ao cadastrar
function generateToken (params = {}){
    return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400, })
    }

router.post('/register', async (req, res) =>{

    const { email } = req.body;

    //cria um novo usuario quando a rota é chamada
    try{
        //returna mensagem caso tente cadastrar o mesmo email
        if (await User.findOne  ({ email }))
        return res.status(400).send({ error: 'User already exists'});
        
        const user = await User.create(req.body);

        user.password = undefined;

        return res.send ({ 
            user,
            token: generateToken({ id: user.id }),
        });

    }catch (err){
        return res.status(400).send({ error: 'Registration failed'})
    }
}); 

//rota de autenticação token
router.post('/authenticate', async (req, res) =>{
    const { email , password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    //verificar usuario
    if(!user)
        return res.status(400).send({ error: 'User not found'});

    //verificando senha
    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password' });

    user.password = undefined;

    //gerar token 

  res.send({
      user,
      token: generateToken({ id: user.id }),
  })

    });

    //recuperar senha
router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try{
    const user = await User.findOne({ email });
        if(!user)
        return res.status(400).send({error:'User not found '});

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
          '$set': {
            passwordResetToken: token,
            passwordResetExpires: now,
          }  
        });

       mailer.sendMail({
           to: email,
           from: 'gianh7@gmail.com',
           template: ''
       })

    }catch(err){
        res.status(400).send({ error: 'Erro on forgot password, try again' });
    }
});
module.exports = app => app.use('/auth', router)