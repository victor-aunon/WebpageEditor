import passportLocal from 'passport-local';
import crypto from 'crypto';

const LocalStrategy = passportLocal.Strategy;

function initializePassport(passport, getUserByName, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const user = await getUserByName(username); // req.body.username

        if (user === null) {
            return done(null, false, {
                message: 'No existen usuarios con ese nombre',
            });
        }

        try {
            crypto.pbkdf2(
                password, // req.body.password
                user.salt,
                100,
                64,
                'sha512',
                (err, key) => {
                    const encryptedPassword = key.toString('base64');

                    if (user.password !== encryptedPassword) {
                        console.log('usuario y/o contraseña incorrecta');
                        return done(null, false, {
                            message: 'Contraseña incorrecta',
                        });
                    } else {
                        console.log('usuario autenticado con éxito');
                        return done(null, user);
                    }
                }
            );
        } catch (error) {
            return done(error);
        }
    };
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, authenticateUser)
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => done(null, getUserById(id)));
}

export { initializePassport };
