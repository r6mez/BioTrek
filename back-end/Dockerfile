FROM node:22.19.0-alpine

# Install system dependencies for Python and compilation
RUN apk add --no-cache \
    bash \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    gcc \
    g++ \
    musl-dev \
    libffi-dev \
    openssl-dev \
    cargo \
    rust \
    git

RUN npm i -g @nestjs/cli typescript ts-node

COPY package*.json /tmp/app/
RUN cd /tmp/app && npm install

COPY . /usr/src/app
RUN cp -a /tmp/app/node_modules /usr/src/app
COPY ./wait-for-it.sh /opt/wait-for-it.sh
RUN chmod +x /opt/wait-for-it.sh
COPY ./startup.relational.dev.sh /opt/startup.relational.dev.sh
RUN chmod +x /opt/startup.relational.dev.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh
RUN sed -i 's/\r//g' /opt/startup.relational.dev.sh

WORKDIR /usr/src/app
RUN if [ ! -f .env ]; then cp env-example-relational .env; fi

# Install Python packages required for chatbot functionality
RUN pip3 install --no-cache-dir --break-system-packages \
    langchain==0.3.27 \
    python-dotenv==1.1.1 \
    langchain_groq==0.3.8 \
    langchain_core==0.3.77 \
    langchain_community \
    langchain_text_splitters \
    langchain_chroma \
    langchain_huggingface \
    requests==2.32.5 \
    pydantic==2.11.9 \
    pandas \
    pypdf \
    bs4 \
    beautifulsoup4 \
    chromadb \
    sentence_transformers \
    huggingface_hub \
    transformers

RUN npm run build

CMD ["/opt/startup.relational.dev.sh"]
