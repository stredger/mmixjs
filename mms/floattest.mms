a	IS	$0
b	IS	$1	
c	IS	$2
d	IS	$3
e	IS	$4
f	IS	$5
g	IS	$6
h	IS	$7			

Main	FLOTI	a,20	%a = 20.0
	FLOTI	b,12.2	%b = 12.2
	FADD	c,a,b	%c = a + b 
	FDIV	d,b,a	%d = a / a
	FSUB	e,c,b	%e = c - b
	FMUL	f,a,a	%f = a * a
	FSQRT	g,f		%g = sqrt(f)	
	TRAP	0,Halt,0

mem after
$0 = 20
$1 = 12.2
$2 = 32.2
$3 = 12.2/20.. some decimal
$4 = 20ish
$5 = 400
$6 = 20