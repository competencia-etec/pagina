from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$argon2id$v=19$m=65536,t=3,p=4$wagCPXjifgvUFBzq4hqe3w$CYaIb8sB+wtD+Vu/P4uod1+Qof8h+1g7bbDlBID48Rc",
        "disabled": False,
    }
}


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


# TODO: Add salting
def hash_password(plain_password: str):
    return password_hash.hash(plain_password)


def get_password_hash(password):
    return password_hash.hash(password)
