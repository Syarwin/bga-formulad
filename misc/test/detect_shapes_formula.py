# USAGE
# python detect_shapes_video.py --video test.mp4

# import the necessary packages
from pyimagesearch.shapedetector import ShapeDetector
from pyimagesearch.centroidtracker import CentroidTracker
from imutils.video import FileVideoStream
import argparse
import imutils
import cv2
import time
import numpy as np
import json


# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-i", "--img", required=True, help="path to the input video")

ap.add_argument("--show", help="what is displayed")
ap.set_defaults(show="image")

ap.add_argument("-s", "--seuil", help="threshold", type=int)
ap.set_defaults(seuil=220)

args = vars(ap.parse_args())


# initialize the video stream and allow the camera sensor to warmup
print("[INFO] starting loading image...")
image = cv2.imread(args["img"])


resized = image #imutils.resize(image, width=800)
ratio = image.shape[0] / float(resized.shape[0])

# if the frame dimensions are None, grab them
(H, W) = image.shape[:2]


# convert the resized image to grayscale, blur it slightly, and threshold it
gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

#blurred = cv2.GaussianBlur(gray, (5, 5), 0)
blurred = gray
thresh = cv2.threshold(blurred, args["seuil"], 255, cv2.THRESH_BINARY)[1]
#thresh = cv2.Canny(thresh, 100, 200)


# find contours in the thresholded image and initialize the
# shape detector
cnts = cv2.findContours(thresh.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
cnts = imutils.grab_contours(cnts)
sd = ShapeDetector()

# Search "rects"
rects = []

with open('test.json', 'w') as file_object:
	file_object.write('[\n');
	for c in cnts:
		M = cv2.moments(c)
		if M["m00"] == 0:
			continue
		cX = int((M["m10"] / M["m00"]) * ratio)
		cY = int((M["m01"] / M["m00"]) * ratio)


		hull = cv2.convexHull(c)
		peri = cv2.arcLength(hull, True)
		if peri < 200 or peri > 500:
			continue

		approx = cv2.approxPolyDP(hull, 0.04 * peri, True)

		if len(approx) >= 4 and len(approx) <= 6:
			# multiply the contour (x, y)-coordinates by the resize ratio,
			# then draw the contours and the name of the shape on the image

			approx = approx.astype("float")
			approx *= ratio
			approx = approx.astype("int")

			[vx,vy,x,y] = cv2.fitLine(approx, cv2.DIST_L2,0,0.01,0.01)
			l = 20
			cv2.line(image,(cX - vx*l, cY - vy*l), (cX + vx*l, cY + vy*l),(0,255,0),2)

	#			cv2.drawContours(image, [c], -1, (0, 255, 0), 2)
			cv2.drawContours(image, [approx], -1, (255, 0, 0), 2)
	#			cv2.putText(image, "Trapeze", (cX, cY), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

			rects.append([cX,cY,vx,vy])

			file_object.write('	{ cx:' + str(cX) + ', cy:' + str(cY) + ', vx:' + str(vx[0]) + ', vy:' + str(vy[0]) + ', box:' + json.dumps(approx.tolist()) + '},\n')
	file_object.write(']\n');




if args["show"] == "image":
	resized = imutils.resize(image, width=2000)
	cv2.imshow("Frame", resized)


if args["show"] == "thresh":
	resized = imutils.resize(thresh, width=1500)
	cv2.imshow("Frame", resized)

cv2.waitKey()


print("[INFO] cleaning up...")
cv2.destroyAllWindows()
#out.release()

