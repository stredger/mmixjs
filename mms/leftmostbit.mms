x	IS	$1
y	IS	$2
t	IS	$3
result	IS	$4

zero	GREG	0

%
% Given a value in register x will 
% calculate the position of the leftmost bit
%

Main	ADDU	x,zero,#8080	%get a value into x
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
	SRU	t,y,32
	OR	y,y,t
	SRU	t,y,1
	SUBU	result,y,t
	TRAP	0,Halt,0