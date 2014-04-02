
rho	IS	$1
x	IS	$2
y	IS	$3
t	IS	$4
q	IS	$5

m0	GREG	#5555555555555555
m1	GREG	#3333333333333333
m2	GREG	#0f0f0f0f0f0f0f0f
m3	GREG	#00ff00ff00ff00ff
m4	GREG	#0000ffff0000ffff
m5	GREG	#00000000ffffffff

zero	GREG	0

Main	ADD	x,zero,#8080

	NEGU	y,x
	AND	y,x,y
	AND	q,y,m5
	ZSZ	rho,q,32

	AND	q,y,m4
	ADD	t,rho,16
	CSZ	rho,q,t

	AND	q,y,m3
	ADD	t,rho,8
	CSZ	rho,q,t

	AND	q,y,m2
	ADD	t,rho,4
	CSZ	rho,q,t

	AND	q,y,m1
	ADD	t,rho,2
	CSZ	rho,q,t

	AND	q,y,m0
	ADD	t,rho,1
	CSZ	rho,q,t

	TRAP	0,Halt,0