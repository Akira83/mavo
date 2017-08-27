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
(declare-const n0002 Int)
(assert 
	(= n0002 1))
;Adding node value range
(assert 
	(and 
(<= n0002 6)
 (>= n0002 1))
)
(assert 
	(and 
(>= n0000 n0001)(>= n0000 n0002))
)
(assert 
	(and 
(>= n0000 n0002)(>= n0000 n0001))
)
(check-sat)
;Print values for each node
(echo "n0000")
(eval n0000)
(echo "n0001")
(eval n0001)
(echo "n0002")
(eval n0002)
