
a	IS	$0
b	IS	$1
c	IS	$2
s	IS	$3
t	IS	$4		%Pseudocode in C:
result	IS	$5
ret	IS	$255
zero	GREG	0

triarea	FADD	s,a,b		%s = a + b;
	FADD	s,s,c		%s += c;
	FLOT	t,2		%t = 2.0;
	FDIV	s,s,t		%s /= t;
	FSUB	t,s,a		%t = s - a;
	FMUL	a,s,t		%a = s * t;
	FSUB	t,s,b		%t = s - b;
	FMUL	a,a,t		%a *= t;
	FSUB	t,s,c		%t = s - c;
	FMUL	a,a,t		%a *= t;
	FSQRT	result,a		%result = sqrt(a);
	GO	ret,ret,0		%return a;


Main	FLOT	a,12		%a = 12.0;
	FLOT	b,15		%b = 15.0;
	FLOT	c,20		%c = 20.0;
	GO	ret,zero,triarea	%result = triarea(a, b, c);
	TRAP	0,Halt,0	%_exit(t);