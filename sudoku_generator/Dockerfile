FROM python:3.9

WORKDIR /opt/app
COPY . /opt/app

RUN pip install -r requirements.txt

ENTRYPOINT [ "python3", "-u", "main.py" ]