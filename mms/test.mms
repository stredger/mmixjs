a	IS	$0
b	IS	$1	
c	IS	$2
d	IS	#0123456789abcdef
f	IS	-1

zero	GREG	0
x2	GREG	0
	
	ADD	c,b,f
	GO	x2,zero,End
Main	ADD	a,zero,d
	SRU	b,a,63
	BZ	zero,-4
End	TRAP	0,Halt,0
