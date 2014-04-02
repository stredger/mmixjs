x	IS	$1
y	IS	$2
t	IS	$3

zero	GREG	0

Main	ADDU	x,zero,#ff

	SRU	t,x,1
	OR	y,x,t

	SRU	t,y,2
	OR	y,y,t

	SRU	t,y,4
	OR	y,y,t

	SRU	t,y,8
	OR	y,y,t

	SRU	t,y,16
	OR	y,y,t

	%SRU	t,y,32
	%OR	y,y,t

	SRU	t,y,1
	SUBU	y,y,t

	TRAP	0,Halt,0