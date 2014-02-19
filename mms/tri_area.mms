	LOC	#100

	PREFIX :tri_area:

	a	IS	$0
	b	IS	$1
	c	IS	$2
	s	IS	$3
	t	IS	$255		%Pseudocode in C:

:tri_area	FADD	s,a,b		%s = a + b;
	FADD	s,s,c		%s += c;
	FLOT	t,2		%t = 2.0;
	FDIV	s,s,t		%s /= t;
	FSUB	t,s,a		%t = s - a;
	FMUL	a,s,t		%a = s * t;
	FSUB	t,s,b		%t = s - b;
	FMUL	a,a,t		%a *= t;
	FSUB	t,s,c		%t = s - c;
	FMUL	a,a,t		%a *= t;
	FSQRT	a,a		%a = sqrt(a);
	POP	1,0		%return a;

	PREFIX :Main:

	argc	IS	$0
	argv	IS	$1
	h	IS	$2
	a	IS	$3
	b	IS	$4
	c	IS	$5
	t	IS	$255

:Main	FLOT	a,12		%a = 12.0;
	FLOT	b,15		%b = 15.0;
	FLOT	c,20		%c = 20.0;
	PUSHJ	h,:tri_area	%h = tri_area(a, b, c);
	SET	t,0		%t = 0;
	TRAP	0,:Halt,0	%_exit(t);