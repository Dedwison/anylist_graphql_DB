import { registerEnumType } from "@nestjs/graphql";


export enum ValidRoles {
    
    admin = 'admin',
    user = 'user',
    superUser = 'superUser',
}

// TODO: Implementar enum como un GraphQl Enum Type.
registerEnumType( ValidRoles, { name: 'ValidRoles'} )