#!/usr/bin/python3
# -*- coding:utf-8 -*-
import sys
import os
picdir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'pic')
libdir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'lib')
if os.path.exists(libdir):
    sys.path.append(libdir)

import logging
from waveshare_epd import epd2in7b
import time
from PIL import Image,ImageDraw,ImageFont,ImageEnhance
import traceback
from argparse import ArgumentParser as AP
import pdb

def main(image_file: str):

    #if verbose: logging.basicConfig(level=logging.DEBUG) 
    #else: logging.basicConfig(level=logging.INFO)

    try:
        logging.info("QR Code DRAW")
    
        epd = epd2in7b.EPD()
        logging.info("init and Clear")
        epd.init()
        epd.Clear()
        time.sleep(2)
    
        # Drawing on the image
        logging.info("Drawing QR Code")
        blackimage = Image.new('1', (epd.width, epd.height), 255)  # 255: clear the frame
        redimage = Image.new('1', (epd.width, epd.height), 255)  # 255: clear the frame
    
        logging.info(f"width = {epd.width}, height = {epd.height}")

        # Drawing on the Horizontal image
        todraw = Image.new('1', (epd.height, epd.width), 255)  # 298*126
        qrcode = Image.open(image_file)
        qrcode = qrcode.resize((epd.width,epd.width), Image.ANTIALIAS)
        qrcode = qrcode.convert("RGB")

        image_enhancer = ImageEnhance.Sharpness(qrcode)
        qrcode = image_enhancer.enhance(2.0)
        qrcode = qrcode.convert("L")
        qrcode.save("sample.bmp")

        image = Image.open("sample.bmp")
        todraw.paste(image, (0,0))
    
        epd.display(epd.getbuffer(todraw), epd.getbuffer(todraw))


        time.sleep(50)
    
        logging.info("Clear...")
        epd.init()
        epd.Clear()
    
        logging.info("Goto Sleep...")
        epd.sleep()
        
    except IOError as e:
        logging.info(e)
    
    except KeyboardInterrupt:    
        logging.info("ctrl + c:")
        epd2in7b.epdconfig.module_exit()
        exit()


if __name__ == '__main__':
    parser = AP()
    parser.add_argument("-f","--file",dest="image_file",help="Draw image from file",default="sample.png")
    parser.add_argument("-v","--verbose",help="Log with detail",default=True,action="store_true")
    logging.basicConfig(level=logging.DEBUG)
    args = parser.parse_args()
    #pdb.set_trace()
    if args.verbose: logging.basicConfig(level=logging.DEBUG)
    else: logging.basicConfig(level=logging.INFO)
    main(args.image_file)
