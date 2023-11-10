CREATE DATABASE communibus;

CREATE TABLE communibus.usuario (`nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `senha` varchar(20) DEFAULT NULL,
  `confirmasenha` varchar(20) DEFAULT NULL,
  `idusuario` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idusuario`));

  