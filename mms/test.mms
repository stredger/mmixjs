a	IS	$0
b	IS	$1	
c	IS	70
d	IS	#0123456789abcdef
e	IS	$2
f	IS	-1
g	IS	#f

zero	GREG	0
x2	GREG	12345679800000
	
	ADD	e,zero,f
	GO	a,zero,End
Main	ADD	a,zero,f
	MUL	b,a,4294967296
	DIV	e,b,4294967296	
End	TRAP	0,Halt,0
