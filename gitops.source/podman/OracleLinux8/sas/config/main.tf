variable "keycloak_client_id" {
  type = string
  default = "werx"
  description = "Keycloak Authenticated Client ID"
}

variable "keycloak_client_secret" {
  type = string
  description = "Keycloak Authenticated Client Secret"
}

variable "keycloak_url" {
  type = string
  default = "http://devat-pdun-uiux-01.tgwdev.internal:8080"
  description = "Keycloak Base URL"
}

variable "keycloak_username" {
  type = string
  default = "admin"
  description = "Keycloak Admin Username"
}

variable "keycloak_password" {
  type = string
  description = "Keycloak Password"
}

variable "keycloak_realm" {
  type = string
  default = "UI-UX"
  description = "Keycloak Realm Name"
}

variable "keycloak_valid_redirect" {
  type = string
  description = "Valid redirct URL"
}

terraform {
  required_version = ">= 0.12"
  required_providers {
    keycloak = {
      source = "mrparkers/keycloak"
      version = "4.1.0"
    }
  }
}

provider "keycloak" {
  client_id     = "admin-cli" # login with this client to create a new realm
  username      = var.keycloak_username
  password      = var.keycloak_password
  realm         = "master" # login to the master realm to create a new realm
  url           = var.keycloak_url
  tls_insecure_skip_verify = true
}

# Create a new realm
#resource "keycloak_realm" uiux {
#  realm             = var.keycloak_realm
#  enabled           = true
#  display_name      = "UIUX Realm for WERX"
#  display_name_html = "<b>UIUX Realm for WERX</b>"
#
#  access_code_lifespan = "30m"
#
#  internationalization {
#    supported_locales = [
#      "en",
#      "de",
#    ]
#
#    default_locale = "en"
#  }
#
#  security_defenses {
#    headers {
#      x_frame_options                     = "SAMEORIGIN"
#      content_security_policy             = "frame-src 'self'; frame-ancestors 'self'; object-src 'none';"
#      content_security_policy_report_only = ""
#      x_content_type_options              = "nosniff"
#      x_robots_tag                        = "none"
#      x_xss_protection                    = "1; mode=block"
#      strict_transport_security           = "max-age=31536000; includeSubDomains"
#    }
#
#    brute_force_detection {
#      permanent_lockout                = false
#      max_login_failures               = 31
#      wait_increment_seconds           = 61
#      quick_login_check_milli_seconds  = 1000
#      minimum_quick_login_wait_seconds = 120
#      max_failure_wait_seconds         = 900
#      failure_reset_time_seconds       = 43200
#    }
#  }
#
#  # set to external if SSL is used
#  ssl_required    = "none"
#}

# Create a auth client
resource "keycloak_openid_client" werx {
  client_id   = var.keycloak_client_id
  name        = var.keycloak_client_id
  realm_id    = "sas-rn-i-central"
  description = "UIUX authentictaion client"

  standard_flow_enabled    = true
  service_accounts_enabled = true
  direct_access_grants_enabled = true

  authorization {
    policy_enforcement_mode = "ENFORCING"
    decision_strategy = "UNANIMOUS"
    allow_remote_resource_management = true
  }

  access_type = "CONFIDENTIAL"

  valid_redirect_uris = [
    var.keycloak_valid_redirect
  ]

  client_secret = var.keycloak_client_secret

  #login_theme = "tgw" # set the login theme here

  backchannel_logout_session_required        = true
  backchannel_logout_revoke_offline_sessions = false
}


# authorization scopes
resource keycloak_openid_client_authorization_scope GET {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "GET"
    realm_id           = "sas-rn-i-central"
}

resource keycloak_openid_client_authorization_scope POST {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "POST"
    realm_id           = "sas-rn-i-central"
}

resource keycloak_openid_client_authorization_scope PUT {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "PUT"
    realm_id           = "sas-rn-i-central"
}

resource keycloak_openid_client_authorization_scope DELETE {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "DELETE"
    realm_id           = "sas-rn-i-central"
}

resource keycloak_openid_client_authorization_scope PATCH {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "PATCH"
    realm_id           = "sas-rn-i-central"
}

resource keycloak_openid_client_authorization_scope SWITCH_STATION {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "SWITCH_STATION"
    realm_id           = "sas-rn-i-central"
}

# authorization resources
resource keycloak_openid_client_authorization_resource App {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "App"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/App"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]
}

resource keycloak_openid_client_authorization_resource Compacting {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "Compacting"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/Compacting"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]
}

resource keycloak_openid_client_authorization_resource Core {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "Core"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/Core"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]
}

resource keycloak_openid_client_authorization_resource Dashboard {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "Dashboard"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/Dashboard"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]
}

resource keycloak_openid_client_authorization_resource MessagingEvent {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "MessagingEvent"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/MessagingEvent"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]
}

resource keycloak_openid_client_authorization_resource Pcots {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "Pcots"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/Pcots"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "SWITCH_STATION"
    ]
}

resource keycloak_openid_client_authorization_resource ReleaseScreen {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "ReleaseScreen"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/ReleaseScreen"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]
}

resource keycloak_openid_client_authorization_resource SmartKinematics {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "SmartKinematics"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/SmartKinematics"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]
}

resource keycloak_openid_client_authorization_resource Widget {
    resource_server_id = keycloak_openid_client.werx.resource_server_id
    name               = "Widget"
    realm_id           = "sas-rn-i-central"

    uris = [
        "/Widget"
    ]

    scopes = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]
}

# authentication client user roles, which are used in the authorization policies
resource "keycloak_role" APP_VIEWER {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "APP_VIEWER"
  description = "This role is used to view all available apps"
}

resource "keycloak_role" APP_MANAGER {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "APP_MANAGER"
  description = "This role is used to manage all available apps"
}

resource "keycloak_role" COMPACTING_USER {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "COMPACTING_USER"
  description = "This role is needed to use the compacting feature"
}

resource "keycloak_role" CORE_USER {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "CORE_USER"
  description = "This role is needed to use core features of the cilog application"
}

resource "keycloak_role" DASHBOARD_EDITOR {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "DASHBOARD_EDITOR"
  description = "This role is needed to modify Dashboard in the TGW-portal"
}

resource "keycloak_role" PCOTS_USER {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "PCOTS_USER"
  description = "This role is needed to use the picking features of the Pick Center One"
}

resource "keycloak_role" PCOTS_MANAGER {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "PCOTS_MANAGER"
  description = "This role is needed to use the switch station feature of Pick Center One"
}

resource "keycloak_role" RELEASE_SCREEN_USER {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "RELEASE_SCREEN_USER"
  description = "This role is needed to use Release Screen of the compacting feature"
}

resource "keycloak_role" SMARTKINEMATICS_USER {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "SMARTKINEMATICS_USER"
  description = "This role is needed to use the SmartKinematics feature"
}

resource "keycloak_role" WIDGET_EDITOR {
  realm_id    = "sas-rn-i-central"
  client_id   = keycloak_openid_client.werx.id
  name        = "WIDGET_EDITOR"
  description = "This role is required if you want to add, delete and update widgets in the TGW-portal."
}

# authorization policies. Currently only role policies are supported
resource keycloak_openid_client_role_policy APP_VIEWER_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "APP_VIEWER_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role APP_VIEWER"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.APP_VIEWER.id
    required = true
  }
}

resource keycloak_openid_client_role_policy APP_MANAGER_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "APP_MANAGER_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role APP_MANAGER"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.APP_MANAGER.id
    required = true
  }
}

resource keycloak_openid_client_role_policy COMPACTING_USER_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "COMPACTING_USER_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role COMPACTING_USER"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.COMPACTING_USER.id
    required = true
  }
}

resource keycloak_openid_client_role_policy CORE_USER_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "CORE_USER_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role CORE_USER"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.CORE_USER.id
    required = true
  }
}

resource keycloak_openid_client_role_policy DASHBOARD_EDITOR_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "DASHBOARD_EDITOR_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role DASHBOARD_EDITOR"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.DASHBOARD_EDITOR.id
    required = true
  }
}

resource keycloak_openid_client_role_policy PCOTS_USER_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "PCOTS_USER_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role PCOTS_USER"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.PCOTS_USER.id
    required = true
  }
}

resource keycloak_openid_client_role_policy PCOTS_MANAGER_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "PCOTS_MANAGER_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role PCOTS_MANAGER"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.PCOTS_MANAGER.id
    required = true
  }
}

resource keycloak_openid_client_role_policy RELEASE_SCREEN_USER_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "RELEASE_SCREEN_USER_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role RELEASE_SCREEN_USER"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.RELEASE_SCREEN_USER.id
    required = true
  }
}

resource keycloak_openid_client_role_policy SMARTKINEMATICS_USER_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "SMARTKINEMATICS_USER_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role SMARTKINEMATICS_USER"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.SMARTKINEMATICS_USER.id
    required = true
  }
}

resource keycloak_openid_client_role_policy WIDGET_EDITOR_REQUIRED {
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  name               = "WIDGET_EDITOR_REQUIRED"
  realm_id           = "sas-rn-i-central"
  description        = "This policy checks if a user has the role WIDGET_EDITOR"
  type               = "role"
  decision_strategy  = "UNANIMOUS"
  logic              = "POSITIVE"

  role {
    id  = keycloak_role.WIDGET_EDITOR.id
    required = true
  }
}

# Authorization scope based permissions
resource keycloak_openid_client_authorization_permission APP_VIEWER_PERMISSION {
  name               = "APP_VIEWER_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.APP_VIEWER_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id
  ]

  resources = [
    keycloak_openid_client_authorization_resource.App.id
  ]
}

resource keycloak_openid_client_authorization_permission APP_MANAGER_PERMISSION {
  name               = "APP_MANAGER_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.APP_MANAGER_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id,
    keycloak_openid_client_authorization_scope.DELETE.id
  ]

  resources = [
    keycloak_openid_client_authorization_resource.App.id
  ]
}

resource keycloak_openid_client_authorization_permission COMPACTING_USER_PERMISSION {
  name               = "COMPACTING_USER_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.COMPACTING_USER_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id,
  ]

  resources = [
    keycloak_openid_client_authorization_resource.Compacting.id
  ]
}

resource keycloak_openid_client_authorization_permission CORE_USER_PERMISSION {
  name               = "CORE_USER_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.CORE_USER_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id,
  ]

  resources = [
    keycloak_openid_client_authorization_resource.Core.id
  ]
}

resource keycloak_openid_client_authorization_permission DASHBOARD_EDITOR_PERMISSION {
  name               = "DASHBOARD_EDITOR_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.DASHBOARD_EDITOR_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id,
    keycloak_openid_client_authorization_scope.DELETE.id
  ]

  resources = [
    keycloak_openid_client_authorization_resource.Dashboard.id
  ]
}

resource keycloak_openid_client_authorization_permission PCOTS_USER_PERMISSION {
  name               = "PCOTS_USER_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.PCOTS_USER_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id,
  ]

  resources = [
    keycloak_openid_client_authorization_resource.Pcots.id
  ]
}

resource keycloak_openid_client_authorization_permission PCOTS_MANAGER_PERMISSION {
  name               = "PCOTS_MANAGER_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.PCOTS_MANAGER_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.SWITCH_STATION.id
  ]

  resources = [
    keycloak_openid_client_authorization_resource.Pcots.id
  ]
}

resource keycloak_openid_client_authorization_permission RELEASE_SCREEN_USER_PERMISSION {
  name               = "RELEASE_SCREEN_USER_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.RELEASE_SCREEN_USER_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id,
  ]

  resources = [
    keycloak_openid_client_authorization_resource.ReleaseScreen.id
  ]
}

resource keycloak_openid_client_authorization_permission SMARTKINEMATICS_USER_PERMISSION {
  name               = "SMARTKINEMATICS_USER_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.SMARTKINEMATICS_USER_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id,
    keycloak_openid_client_authorization_scope.DELETE.id,
    keycloak_openid_client_authorization_scope.PATCH.id
  ]

  resources = [
    keycloak_openid_client_authorization_resource.SmartKinematics.id
  ]
}

resource keycloak_openid_client_authorization_permission WIDGET_EDITOR_PERMISSION {
  name               = "WIDGET_EDITOR_PERMISSION"
  realm_id           = "sas-rn-i-central"
  resource_server_id = keycloak_openid_client.werx.resource_server_id
  type               = "scope"
  decision_strategy  = "UNANIMOUS"

  policies = [
    keycloak_openid_client_role_policy.WIDGET_EDITOR_REQUIRED.id
  ]

  scopes = [
    keycloak_openid_client_authorization_scope.GET.id,
    keycloak_openid_client_authorization_scope.POST.id,
    keycloak_openid_client_authorization_scope.PUT.id,
    keycloak_openid_client_authorization_scope.DELETE.id
  ]

  resources = [
    keycloak_openid_client_authorization_resource.Widget.id
  ]
}

# Create a default user for testing
resource "keycloak_user" test {
  realm_id   = "sas-rn-i-central"
  username   = "test"
  enabled    = true

  email      = "test@test.com"
  first_name = "Max"
  last_name  = "Mustermann"

  initial_password {
    value     = "test"
    temporary = false # set to true to force user to change password on first login
  }
}

# Apply all UIUX roles to the test user
resource "keycloak_user_roles" test_uiux_roles {
  realm_id = "sas-rn-i-central"
  user_id  = keycloak_user.test.id

  role_ids = [
    keycloak_role.APP_VIEWER.id,
    keycloak_role.APP_MANAGER.id,
    keycloak_role.COMPACTING_USER.id,
    keycloak_role.CORE_USER.id,
    keycloak_role.DASHBOARD_EDITOR.id,
    keycloak_role.PCOTS_USER.id,
    keycloak_role.PCOTS_MANAGER.id,
    keycloak_role.RELEASE_SCREEN_USER.id,
    keycloak_role.SMARTKINEMATICS_USER.id,
    keycloak_role.WIDGET_EDITOR.id
  ]
}
