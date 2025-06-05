#!/bin/bash
cd /home/kavia/workspace/code-generation/cinequiz--artguess-31272-438ff657/cinequiz_artguess
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

