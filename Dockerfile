FROM ubuntu 
WORKDIR /hycon
ADD ./bundle-* /hycon
ADD ./bundle-*/data/clientDist /hycon/data/clientDist
ADD ./bundle-*/data /hycon/data
RUN chmod +x hycon
EXPOSE 8148 2442
CMD ["/hycon/hycon","--nonLocal","--api","--peer","121.182.48.105:62850","121.182.48.106:56639", "--api_port=2442", "--cpuMiners=0"]
