    # User :
    Comando balance : Información de su dinero cash y dinero en su banco
    - Este comando busca el perfil y le devuelve la cantidad de dinero de su cash y banco, si el perfil no existe lo crea

    












    Comando inventory: Este comando le mostrara al usuario todos sus items al usuario con sus respectivas cantidades.

    Para que un usuario pueda transferir a otro usuario directamente a su banco. Deberá saber su código de banco.
    /codigo [nombre o numero]

    Este código podrá asignarse al usuario. Es decir si un usuario quiere transferirme directamente a mi banco, necesitara saber mi código.
    De lo contrario sólo deberá retirar el dinero con /with y pagar con el comando /pay. Supongamos que mi código de banco es "lagarto"

    Entonces el otro usuario deberá colocar el comando /transferir [codigo][cantidad] , en este caso sería /transferir [lagarto][100]

    # Comandos Generales
    Comando /with [cantidad]       : Este comando te permite retirar dinero de tu banco, colocándolo en tu dinero cash. Si desea retirar todo su dinero /with [all] y todo su dinero pasará al cash.

    Comando /top                    : Mostrara a todos los usuarios de manera descendente su cantidad del banco ( a mayor dinero en su banco, mayor posicion del top).

    Comando /pay [usuario][cantidad]: Este comando te permite pagar a un usuario mencionándolo o colocando su id de usuario. El pago le llegara al usuario a su dinero cash.

    Comando profesion  : El usuario podra elegir que profesion ser, policia, ladron, medico, etc. Cada profesion tiene su work. (debemos pensar qué más colocar )

    Comando work        : Trabajo que tendrá el usuario dependiendo de su profesión podrá ganar cierto dinero .
    Comando shop        : Donde habran muchos items a la venta con sus precios.
    Comando buy         : El usuario podrá comprar cualquier item con el comando /buy [item][cantidad] y se le añadirá a su inventario

    Comando /transferir [codigo][cantidad] : Permite al usuario transferir dinero directamente al banco de otro usuario colocando el código del otro usuario y la cantidad a transferir.



    # Mini juegos
    Mini juego Russian Roullete : El usuario podrá jugar a la ruleta rusa


    # Comandos para Usuarios Administradores

    Comando remove-money :
    /remove-money [usuario][cash][cantidad][razon]  : Le removera el dinero del cash al usuario.
    /remove-money [usuario][bank][cantidad][razon]  : Le removera al dinero del banco al usuario.

    Comando add-money :
    /add-money [usuario][cash][cantidad][razon]  : Le anadira  dinero al cash al usuario.
    /add-money [usuario][bank][cantidad][razon]  : Le anadira dinero al  banco del usuario

    Comando add-item y remove-item :
    /remove-item [usuario][item][cantidad] : Le quitara al usuario el item y su cantidad.
    /add-item [usuario][item][cantidad]    : Le añadira al usuario el item y su cantidad.

    Comando collect :
    /collect : Este comando añadirá dinero al usuario en su bnaco, de acuerdo a los roles que tenga


    # Item-info

    /item-info [item]
    Comando que que dará información sobre el item: Rol requerido, stock, description, price.

    # setcollect

    Este  comando te permite añadir roles al collect. ( Sólo los administradores pueden usar este comando ) :
    /setcollect [role][cantidad][tiempoenminutos]

    Función :

    Esto hará que le asigné una cantidad a ganar al usuario cada vez que use el collect.
    Por ejemplo: yo como usuario compro el item usuarip vip y lo uso. Me da un role llamando Usuario vip, el role usuario vip tiene un collect de 3000$ , es decir que cada vez que use el comando collect me dará 3000 de dinero. Y ojo, como dice el usuario vip. El collect del usuario vip es cada 4horas.

    Por ejemplo 2 :Yo tengo el role usuario y usé el comando /collect, me dio 3000 de dinero. Ahora quiero volverlo a usar así no hayan pasado 4 horas, entonces no me debería de dar nada porque ya lo usé anteriormente y todavía no pasan 4horas. Pero si tuviera otro role que tenga collect sí me debería de dar.


    # Items :
    1.- Cada item debe tener un id ( identificador único o podemos enumerarlo)
    2.- El nombre del item puede ser solo una palabra (no tener lógica) o tambien sera un rol del servidor ( que el mismo bot creará al ser comprado por el usuario o usará uno ya creado )
    3.- Cada item tendrá unos requerimientos y propiedades :

    -  Rol required  : Cada item podrá tener cierto rol requerido si en caso tuviese
    -  Stock         : Cada item debe tener un stock (también puede ser infinito).
    -  Descripción   : Cada item debe estar bien descrito, qué hace exactamente.
    -  Price         : Cada item debe tener un precio

    ## Item 1 :  Usuario Vip :
    Rol required : No requerido
    Stock : Infinito
    Descripcion : Obtendra un rol llamado Usuario Vip 💎
    Precio : $ 1,000.000
    Beneficios
    - Acceso a crear salas personalizadas
    - Se le añadirá a su inventario 5 items coronas y ladron
    - Collect : $ 3.000 de dinero cada 4horas

    #### Acciones que debe hacer el bot :
    - El usuario que use el ITEM usuario vip, el bot Asignara el rol Usuario Vip al usuario. ( id del role usuario vip 1176193150352642125)
    - Le dará al usuario 5 items coronas y 5 ladron.


    ## Item 2 :


    # Shop :
    El shop debe ser un comando, que mostrara todos los items que iremos agregando. Sera como una tienda, donde podremos comprar con el comando /buy [item] [cantidad]

    - Los items deben estar enumerados 1,2,3,4,5,6,7,8, etc.
    Comandos para usuario
    /use [item] [cantidad] : usara el item que compraste y aplicará la acción del bot según el item







    # Apuestas :

    Muy pronto añadiremos apuestas donde el usuario podra ver las partidos con sus respectivas ligas y cuotas de cada ganador y empate.
    El administrador tendrá que revisar las apuestas y dictar ganador.
    Por ejemplo. Uso el comando /apuestas, me sale una lista de partidas con sus ligas.
    El comando /apostar [1][resultado][cantidaddedinero]
    [1] : Es EL PRIMER PARTIDO
    [resultado] : el usuario tendrá que escribir el nombre del equipo ganador o si en caso también puede escribir empate
    [cantidaddedinero] : la cantidad de dinero a apostar, será descontado de su banco

    Luego de que el partido haya terminado.(No sabemos si ya terminó o no, por eso estamos colocando que el administrador podrá dictar el ganador)
    Ejemplo
    /resultado [1][barcelona] : Indica que el el ganador del primer partido fue barcelona, y automáticamente se les pagará a las personas que apostaron por barcelona de acuerdo a la cuota y su cantida de apostar. Luego se les descontará a los otros usuarios que no apostaron por barcelona ( si en caso haya ).
