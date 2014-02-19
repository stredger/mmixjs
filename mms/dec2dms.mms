	LOC	#100

	PREFIX	:dec2dms:

	dec	IS	$0
	d	IS	$0
	m	IS	$1
	s	IS	$2
	t	IS	$255

:dec2dms	FLOT	t,60		%t = 60.0;
	SET	m,d		m = d;
	FINT	d,:ROUND_OFF,d	%d = floor(d);
	FSUB	m,m,d		%m -= d;
	FMUL	m,m,t		%m *= t;
	SET	s,m	s = m;
	FINT	m,:ROUND_OFF,m	%m = floor(m);
	FSUB	s,s,m		%s -= m;
	FMUL	s,s,t		%s *= t;
	POP	3,0		%return (d, m, s);

	PREFIX :dms2dec:

	d	IS	$0
	m	IS	$1
	s	IS	$2
	dec	IS	$0
	t	IS	$255

:dms2dec	FLOT	t,60		%t = 60.0;
	FDIV	m,m,t		%m /= t;
	FADD	dec,dec,m	%dec += m;
	FMUL	t,t,t		%t *= t;
	FDIV	s,s,t		%s /= t;
	FADD	dec,dec,s	%dec += s;
	POP	1,0		%return dec;

	PREFIX	:Main:

	argc	IS	$0
	argv	IS	$1
	h	IS	$2
	arg1	IS	$3
	arg2	IS	$4
	arg3	IS	$5
	t	IS	$255

:Main	FLOT	arg1,60		%arg1 = 60.0;
	FLOT	arg2,36		%arg2 = 36.0; arg3 = 0.0;
	PUSHJ	h,:dms2dec	%h = dms2dec(arg1, arg2, arg3);
	SET	arg1,h		%arg1 = h;
	PUSHJ	h,:dec2dms	%(arg1, arg2, h) = dec2dms(arg1);
	SET	arg3,h		%arg3 = h;
	PUSHJ	h,:dms2dec	%h = dms2dec(arg1, arg2, arg3);
	SET	t,0		%t = 0;
	TRAP	0,:Halt,0	%_exit(t);