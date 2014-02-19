	LOC	Data_Segment
	GREG	@
txt	BYTE	"Hello world!",10,0

	LOC	#100

	str	IS	$255
	
Main	LDA	str,txt
	TRAP	0,Fputs,StdOut
	TRAP	0,Halt,0