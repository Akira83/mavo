(declare-const n0000 Int)
;Adding node value range
(assert 
	(and 
(<= n0000 6)
 (>= n0000 1))
)
(declare-const n0001 Int)
;Adding node value range
(assert 
	(and 
(<= n0001 6)
 (>= n0001 1))
)
(assert 
	(and 
(= n0001 n0000))
)
(check-sat)
;Print values for each node
(echo "n0000")
(eval n0000)
(echo "n0001")
(eval n0001)
