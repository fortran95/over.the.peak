Over the Peak
=============

A customed http proxy system, containing a server and a client. You will need
to own a server to set up the server part. The client part runs on your
computer and proceeds what your browser sends it, like a normal HTTP proxy.

The goal is to practice and to make a customed proxy, to ensure that the
security is, to me, satisfable. I plan to implement such features:

* Strongest possible encryption in transmission.
* Client-part should be able to filter HTTP request.
* Client-part supports using an underlying proxy, either of SOCKSv5 or HTTP.
