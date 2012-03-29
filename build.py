#!/usr/bin/env python
"""Methods for doing includes in SVGs
"""
import sys
import logging
import csv

from StringIO import StringIO
from lxml import etree

log = logging.getLogger(__name__)

def command_include(root, elem, **kwargs):
    pass

def _parse_quoted_str(qstr):
    """Parse quoted strings
    """
    # hackish way of doing it
    parts = [ x for x in csv.reader(StringIO(qstr), delimiter=' ') ][0]
    return parts[0], ' '.join(parts[1:])

def parse_argstr(argstr):
    """Parse the argument string in to a list of (key, value) tuples
    """
    key, _argstr = argstr.split('=', 1)
    value, _argstr = _parse_quoted_str(_argstr)
    yield (key, value)
    if len(_argstr):
        for result in parse_argstr(_argstr):
            yield result

def process_svg(infile=sys.stdin, outfile=sys.stdout):
    """Process includes in an SVG and replace them according to the rules
    """
    svg = etree.parse(infile)
    root = svg.getroot()

    for comment in root.iter():
        # find all the command comments
        if isinstance(comment, etree._Comment):
            comment_text = comment.text.strip()
            # command comments start with #
            if comment_text.startswith('#'):
                command, argstr = comment_text[1:].split(' ', 1)

                # run the command function 
                command_func = "command_{0}".format(command)
                if command_func in globals():
                    globals()[command_func](root, comment, **dict(parse_argstr(argstr)))
                else:
                    log.info("No command: {0}".format(command))

    #~ outfile.write(etree.tostring(root))

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s %(levelname)s %(message)s')

    process_svg()
