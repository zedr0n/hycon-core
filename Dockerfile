FROM ubuntu 
WORKDIR /hycon
ADD ./bundle-* /hycon
ADD ./bundle-*/data/clientDist /hycon/data/clientDist
ADD ./bundle-*/data /hycon/data
RUN chmod +x hycon
EXPOSE 8148
CMD ["/hycon/hycon","--api","--peer","218.237.189.116:53237", "--api_port=2442", "--cpuMiners=0"]
