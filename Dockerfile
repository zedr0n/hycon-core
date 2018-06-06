FROM ubuntu 
WORKDIR /hycon
ADD ./bundle-* /hycon
ADD ./bundle-*/data/clientDist /hycon/data/clientDist
ADD ./bundle-*/data /hycon/data
RUN chmod +x hycon
EXPOSE 8149 2443
CMD ["/hycon/hycon","--nonLocal","--api","--peer"."127.0.0.1:8148","121.182.48.105:62850","121.182.48.106:56639", "--api_port=2443", "--cpuMiners=0"]
