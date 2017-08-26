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
;Link propagation 
(assert 
	(or 
(or 
(and 
(= n0000 1)
 (= n0001 2))
(and 
(= n0000 2)
 (= n0001 2))
(and 
(= n0000 5)
 (= n0001 5))
(and 
(= n0000 6)
 (= n0001 5))
(and 
(= n0000 3)
 (= n0001 3))
(and 
(= n0000 4)
 (= n0001 4))
)

 (= n0001 4))
)
(check-sat)
;Print values for each node
(echo "n0000")
(eval n0000)
(echo "n0001")
(eval n0001)
