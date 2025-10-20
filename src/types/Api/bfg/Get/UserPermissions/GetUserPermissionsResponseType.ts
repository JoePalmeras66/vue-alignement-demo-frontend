import { z } from 'zod'

export const UserPermissionTypeValidator = z.object({
  scopes: z.array(z.string()),
  rsname: z.string(),
})
export type UserPermissionType = z.infer<typeof UserPermissionTypeValidator>

export const UserPermissionsTypeValidator = z.array(UserPermissionTypeValidator)
export type UserPermissionsType = z.infer<typeof UserPermissionsTypeValidator>

export const GetUserPermissionsResponseTypeValidator = z.object({
  success: z.boolean(),
  data: UserPermissionsTypeValidator,
})
export type GetUserPermissionsResponseType = z.infer<
  typeof GetUserPermissionsResponseTypeValidator
>
