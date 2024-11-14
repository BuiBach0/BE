import { applyDecorators, SetMetadata } from "@nestjs/common";

export function Roles(roles: string[]) {
    return applyDecorators(
        SetMetadata('roles', roles)
    )
}