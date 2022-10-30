set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "public"."Players" (
	"username" TEXT NOT NULL,
	"Wins" integer NOT NULL,
	"Losses" integer NOT NULL,
  "mmr" integer NOT NULL,
	CONSTRAINT "Players_pk" PRIMARY KEY ("username")
) WITH (
  OIDS=FALSE
);
