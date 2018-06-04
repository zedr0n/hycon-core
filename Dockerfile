FROM ubuntu 
WORKDIR /hycon
ADD ./bundle-* /hycon
ADD ./bundle-*/data/clientDist /hycon/data/clientDist
ADD ./bundle-*/data /hycon/data
RUN chmod +x hycon
CMD ["/hycon","--api", "--api_port=2442", "--cpuMiners=0"]
