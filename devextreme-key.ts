import config from 'devextreme/core/config'

const licenseKey =
  'ewogICJmb3JtYXQiOiAxLAogICJjdXN0b21lcklkIjogIjJiNDBiODBlLTI2YTgtNDI5Yi05MzA2LWZiNTU1ZjIzNTk3MiIsCiAgIm1heFZlcnNpb25BbGxvd2VkIjogMjMyCn0=.Ra1AzYi+PExL+Ev7wa7urFGgLxBvCuaFcCSJVfgYmsCgwssU6frUjM2s4izz5HGIg12X65tREsaEuJDy6Uyi6ZTSVR6IIGZgAc6XI3k+RD+MCrLnypvnH2ckO1Sr99GrrGBwBA=='

export const configureDevExpressLicence = () => {
  config({ licenseKey })
}
