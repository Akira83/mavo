#!/usr/bin/python

import sys, json
import cgi, cgitb
import os
cgitb.enable()

#call JAVA app
os.system("java -jar /u/marcel/bin/istar.jar")

#Object to be sent back to frontend
result = {}
result['success'] = True
result['message'] = "This is a response from server"

print 'Content-Type: application/json\n\n'
print json.dumps(result)
