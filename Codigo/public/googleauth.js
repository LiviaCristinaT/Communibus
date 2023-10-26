const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: '711625425532-epfmcjvpc9295c6gtb4grl385im20muk.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:4001/auth/google/callback',
},
    (token, tokenSecret, profile, done) => {

        const query = 'SELECT * FROM usuario WHERE googleId = CAST(idusuario AS SIGNED)';
        db.query(query, [profile.id], (err, results) =>{
            if(err){
                return done(err,false);
            }

            if(results.length > 0){
                return done(null, results[0]);
            }

            else{
                const novoUsuario = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                };
        
                db.query('INSERT INTO usuario SET ?', novoUsuario, (err, res) =>{
                    if(err){
                        return done(err, false);
                    }
        
                    return done(null, novoUsuario);
                });

            }
        })


    }
))