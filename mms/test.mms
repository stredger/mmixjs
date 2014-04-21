a	IS	$0
b	IS	$1	
c	IS	$2
d	IS	$3
d	IS	#0123456789abcdef
e	IS	$4
f	IS	-1
g	IS	#f

zero	GREG	0
x2	GREG	12345679800000
	
	ADD	e,zero,f
	GO	a,zero,End
Main	ADD	a,zero,f
	SLU	b,a,63
End	TRAP	0,Halt,0
