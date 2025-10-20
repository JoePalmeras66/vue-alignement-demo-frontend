# production stage
FROM nginxinc/nginx-unprivileged AS production-stage
#COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY /dist /usr/share/nginx/html
COPY ./default.conf.template /default.conf.template
# change permission of default.conf to be able to run in a non root container environment e.g Openshift
RUN chmod 777 /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["/bin/sh" , "-c" , "envsubst < /default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
