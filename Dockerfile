FROM ubuntu 
WORKDIR /hycon
ADD ./bundle-* /hycon
ADD ./bundle-*/data/clientDist /hycon/data/clientDist
ADD ./bundle-*/data /hycon/data
RUN chmod +x /hycon/launch.sh

ENTRYPOINT ["/hycon/launch.sh"]
