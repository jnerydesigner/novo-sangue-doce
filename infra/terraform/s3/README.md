# S3 Bucket

Terraform simples para criar um bucket S3 privado para o Sangue Doce.

## Fluxo recomendado

Crie o bucket uma vez com um usuario administrador ou um usuario temporario de bootstrap:

```bash
aws s3api create-bucket --bucket sangue-doce --region us-east-1
```

Depois use um usuario IAM restrito ao bucket `sangue-doce` e importe o bucket para o state:

```bash
cd infra/terraform/s3
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform import aws_s3_bucket.this sangue-doce
```

Confira se `terraform.tfvars` usa o mesmo nome:

```hcl
bucket_name = "sangue-doce"
```

Entao rode:

```bash
terraform fmt
terraform validate
terraform plan
terraform apply
```

## Fluxo bootstrap

Se quiser que o Terraform crie o bucket, rode com um usuario de bootstrap que tenha
`s3:CreateBucket`. Depois remova/desative essa credencial e use apenas o usuario de deploy.

## Credenciais

Use credenciais AWS no ambiente, por exemplo:

```bash
export AWS_PROFILE=seu-profile
```

ou configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e, se necessario, `AWS_SESSION_TOKEN`.

## Politicas IAM

Exemplos prontos:

- `iam/deploy-policy.example.json`: usuario diario, sem permissao para criar buckets.
- `iam/bootstrap-policy.example.json`: usuario temporario para criar o bucket.

Troque `sangue-doce` nos arquivos se escolher outro nome.

## Observacoes

- O bucket nasce privado.
- O acesso publico fica bloqueado.
- Versionamento fica ativo.
- Criptografia server-side `AES256` fica ativa.
- `force_destroy` vem como `false` para evitar apagar objetos por acidente.
