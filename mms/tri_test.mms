	LOC	#100
% 
% Heron's Formula: given 3 sides of a triangle (a,b,c) calcs the area.
%  
%  A = (p(p-a)(p-b)(p-c))^(1/2), p = (a+b+c)/2
%

	PREFIX Main:

argc	IS	$0
argv	IS	$1
h	IS	$2
a	IS	$3
b	IS	$4
c	IS	$5
s	IS	$6	
t	IS	$255

Main	FLOTI	a,12		%a = 12.0;
	FLOTI	b,15		%b = 15.0;
	FLOTI	c,20		%c = 20.0;

:tri_area	FADD	s,a,b		%s = a + b;
	FADD	s,s,c		%s += c;
	FLOTI	t,2		%t = 2.0;
	FDIV	s,s,t		%s /= t;
	FSUB	t,s,a		%t = s - a;
	FMUL	a,s,t		%a = s * t;
	FSUB	t,s,b		%t = s - b;
	FMUL	a,a,t		%a *= t;
	FSUB	t,s,c		%t = s - c;
	FMUL	a,a,t		%a *= t;
	FSQRT	a,a		%a = sqrt(a);

	SET	t,0		%t = 0;
	TRAP	0,Halt,0	%_exit(t);

